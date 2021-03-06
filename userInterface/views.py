from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import numpy as np
import io
import socket
import struct
import urllib
import json
import cv2
import os
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import UserCreationForm
from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect, HttpResponse, HttpResponseServerError
from django.http import StreamingHttpResponse
from django.template import Context, Template
from django.views.decorators import gzip
from userInterface.forms import SignUpForm, VisitorForm
from django.urls import reverse
import imutils
import face_recognition
import pickle
from userInterface.models import Visitor
from datetime import datetime
import re
import base64
from django.views.generic.edit import FormView
from requests import request


def FrameProcess(request):

    if request.method == 'POST':
        print("getting")
        form = FrameForm(request.POST)
        if form.is_valid():
            dataUrlPattern = re.compile('data:image/(png|jpeg);base64,(.*)$')
            ImageData = request.POST.get('hidden_image_field')
            ImageData = dataUrlPattern.match(ImageData).group(2)
            # If none or len 0, means illegal image data
            if (ImageData == None or len(ImageData)) == 0:
                # PRINT ERROR MESSAGE HERE
                print("Error getting data")
                pass

            # Decode the 64 bit string into 32 bit
            ImageData = base64.b64decode(ImageData)
            fh = open("imageToSave.png", "wb")
            fh.write(ImageData)
            fh.close()
        else:
            print("INVALID FORM")


def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('index')
    else:
        form = SignUpForm()
    return render(request, 'registration/signup.html', {'form': form})


def userInfo(request):
    return render(request, 'en/authorized_person_page.html', None)

@login_required
def add_visitor(request):
    if request.method == 'POST':
        form = VisitorForm(request.POST)
        if form.is_valid():
            form.save()
            response_data = {}
            response_data['result'] = 'Create post successful!'
            response_data['postpk'] = form.pk
            response_data['name'] = form.text
            response_data['visit_date'] = form.visit_date.strftime('%I:%M %p')
            response_data['face'] = form.face

            return HttpResponse(
                json.dumps(response_data),
                content_type="application/json"
            )
        else:
            return HttpResponse(
                json.dumps({"nothing to see": "this isn't happening"}),
                content_type="application/json"
            )

@login_required
def livestream(request):
    return render(request, 'en/facecam_livestream.html', None)


@login_required
def recognWoPy(request):
    return render(request, 'en/facecam_livestream_wopython.html', None)
# Create your views here.


@login_required
def index(request):
    # Render the HTML template index.html with the data in the context variable
    return render(request, 'en/main_menu.html', None)

#def up(request):
#   import json
#   upload_history =  your orm query  to fetch data
#    json_data = json.dumps( obj_list )
#    return HttpResponse( json_data, mimetype='application/json' )
def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
                login(request,user)
                return HttpResponseRedirect(reverse('index'))
            else:
                return HttpResponse("Your account was inactive.")
        else:
            print("Someone tried to login and failed.")
            print("They used username: {} and password: {}".format(username,password))
            return HttpResponse("Invalid login details given")
    else:
        return render(request, 'registration/login.html', {})

def startListen():
    yield (b'--frame\r\n'
           b'Content-Type: image/jpeg\r\n\r\n' + open('static/assets/1.jpg', 'rb').read() + b'\r\n\r\n')
    server_socket = socket.socket()
    server_socket.bind(('45.61.49.21', 8005))
    encodings_path = 'static/recongition/encodings.pickle'
    face_cascade_path = 'static/recongition/haarcascade_frontalface_default.xml'

    print("Listening on port 8005...")
    server_socket.listen(0)


    # Accept a single connection and make a file-like object out of it
    connection = server_socket.accept()[0].makefile('rb')

    print("[1] loading encodings and classifier...")
    detector = cv2.CascadeClassifier(face_cascade_path)
    data = pickle.loads(open(encodings_path, "rb").read())


    try:
        while True:
            # Read the length of the image as a 32-bit unsigned int. If the
            # length is zero, quit the loop
            image_len = struct.unpack('<L', connection.read(struct.calcsize('<L')))[0]
            if not image_len:
                print("out")

                break
            # Construct a stream to hold the image data and read the image
            # data from the connection
            image_stream = io.BytesIO()
            image_stream.write(connection.read(image_len))

            # Rewind the stream, open it as an image with PIL and do some
            # processing on it
            #image_stream.seek(0)
            # image = base64.b64encode(image_stream.getvalue())
            # filename = 'someimage.png'
            file_bytes = np.fromstring(image_stream.getvalue(), dtype=np.uint8)
            frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

            ##PROCESS IMAGE HERE ##

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            # Detect faces in the frame
            rects = detector.detectMultiScale(gray, scaleFactor=1.1,
                                                   minNeighbors=5, minSize=(30, 30),
                                                   flags=cv2.CASCADE_SCALE_IMAGE)

            boxes = [(y, x + w, y + h, x) for (x, y, w, h) in rects]
            encodings = face_recognition.face_encodings(rgb, boxes)
            names = []
            visitors = []
            counter = 0
            if encodings:
                for encoding in encodings:
                    # essaye de trouver un match pour la face capture
                    matches = face_recognition.compare_faces(data["encodings"],
                                                             encoding)
                    name = "Unknown"

                    # SSi on a des mathchs
                    if True in matches:
                        # trouver le id de la photo avec plus grand matchs
                        matchedIdxs = [i for (i, b) in enumerate(matches) if b]
                        counts = {}
                        for i in matchedIdxs:
                            name = data["names"][i]
                            counts[name] = counts.get(name, 0) + 1

                        name = max(counts, key=counts.get)

                        names.append(name)
                        # Montre la face reconnu avec un rectangle identifiant ses traits de visages
                        for ((top, right, bottom, left), name) in zip(boxes, names):
                            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
                            y = top - 15 if top - 15 > 15 else top + 15
                            name.replace("_", " ")
                            cv2.putText(frame, name, (left, y), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)

                        #CREATE MODEL HERE :
                        #dump face :
                        time = datetime.now()
                        strTime = time.strftime("%Y-%m-%d-%H:%M:%S")
                        imgname = name+'-'+strTime+'.jpg'
                        cv2.imwrite('frame.jpg', frame)
                        cv2.imwrite('static/recongition/faces/'+imgname, frame)

                        #add visitor :
                        if name not in visitors :
                            visitors.append(name)
                            visitor = Visitor(name=name,face=imgname,visit_date=time)

                            visitor.save()

                    #IF UNKNOWN FACE
                    else :
                        counter+=1
                        #save encoding and name for unknown person :
                        data["encodings"].append(encoding)
                        data["names"].append(name)
                        names.append(name)
                        imgname = 'New_Visitor_'+counter.__str__()

                        for ((top, right, bottom, left), name) in zip(boxes, names):
                            cv2.rectangle(frame, (left, top), (right, bottom), (0, 255, 0), 2)
                            y = top - 15 if top - 15 > 15 else top + 15
                            name.replace("_", " ")
                            cv2.putText(frame, name, (left, y), cv2.FONT_HERSHEY_SIMPLEX, 0.75, (0, 255, 0), 2)
                        cv2.imwrite('static/recongition/faces/'+imgname, frame)
                        cv2.imwrite('frame.jpg', frame)
            else :
                #new_Frame = recognizer.recognize_frame(frame)
                cv2.imwrite('frame.jpg', frame)

            ##END OF PROCESSING##


            print("frame sent & saved")
            #image64 = base64.b64encode(image_stream.getvalue())
            #jpeg = cv2.imencode('.jpg',img)
            #frame = img



            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + open('frame.jpg', 'rb').read() + b'\r\n\r\n')
            # with open(filename, 'wb') as f:
            #    f.write(image)
    finally:
        connection.close()
        server_socket.close()

def catchImage():
    datauri = 'data:image/png;base64,iVBORw0K'
    imgstr = re.search(r'base64,(.*)', datauri).group(1)
    output = open('output.png', 'wb')
    output.write(imgstr.decode('base64'))
    output.close()


def stream_view(request):
    try:
        return StreamingHttpResponse(startListen(), content_type="multipart/x-mixed-replace;boundary=frame")
    except HttpResponseServerError as e:
        print("aborted")
