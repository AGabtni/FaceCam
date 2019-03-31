from imutils.video import VideoStream
from imutils.video import FPS
import face_recognition
import imutils
import pickle
import time
import cv2

class face_recognizer:
   'Face recognizer'
   encodings_path = 'static/recongition/encodings.pickle'
   face_cascade_path = 'static/recongition/haarcascade_frontalface_default.xml'

   def __init__(self):
        print("[1] loading encodings and classifier...")
        self.detector = cv2.CascadeClassifier(self.face_cascade_path)
        self.data = pickle.loads(open(self.encodings_path, "rb").read())

   def recognize_frame(self,arg1):
       frame = cv2.imread('frame.jpg', 0)
       if(frame != None):
           # Grab and format the current frame coming from the camera stream
           frame = imutils.resize(frame, width=500)

           gray = cv2.cvtColor(frame, cv2.COLOR_BGR2RGBA)

           rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGBA)

           # Detect faces in the frame
           rects = self.detector.detectMultiScale(gray, scaleFactor=1.1,
                                             minNeighbors=5, minSize=(30, 30),
                                             flags=cv2.CASCADE_SCALE_IMAGE)

           boxes = [(y, x + w, y + h, x) for (x, y, w, h) in rects]
           encodings = face_recognition.face_encodings(rgb, boxes)
           names = []
           for encoding in encodings:
               # essaye de trouver un match pour la face capture
               matches = face_recognition.compare_faces(self.data["encodings"],
                                                        encoding)
               name = "Unknown"

               # SSi on a des mathchs
               if True in matches:
                   # trouver le id de la photo avec plus grand matchs
                   matchedIdxs = [i for (i, b) in enumerate(matches) if b]
                   counts = {}
                   for i in matchedIdxs:
                       name = self.data["names"][i]
                       counts[name] = counts.get(name, 0) + 1

                   name = max(counts, key=counts.get)

                   names.append(name)
                   # Montre la face reconnu avec un rectangle identifiant ses traits de visages
                   for ((top, right, bottom, left), name) in zip(boxes, names):
                        cv2.rectangle(frame, (left, top), (right, bottom),(0, 255, 0), 2)
                        y = top - 15 if top - 15 > 15 else top + 15
                        name.replace("_", " ")
                        cv2.putText(frame, name, (left, y), cv2.FONT_HERSHEY_SIMPLEX,0.75, (0, 255, 0), 2)
                        return frame
               else :
                    return frame
