from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from requests import request
import re
import base64


class SignUpForm(UserCreationForm):
    first_name = forms.CharField(max_length=30, required=False, help_text='Optional.')
    last_name = forms.CharField(max_length=30, required=False, help_text='Optional.')
    email = forms.EmailField(max_length=254, help_text='Required. Inform a valid email address.')

    class Meta:
        model = User
        fields = ('username', 'first_name', 'last_name', 'email', 'password1', 'password2', )


class FrameForm(forms.Form):

    hidden_image_field = forms.CharField(widget=forms.HiddenInput(), required=False)

    def get_frame(self):
        dataUrlPattern = re.compile('data:image/(png|jpeg);base64,(.*)$')
        ImageData = request.POST.get('hidden_image_field')
        ImageData = dataUrlPattern.match(ImageData).group(2)

        # If none or len 0, means illegal image data
        if (ImageData == None or len(ImageData)) == 0:
            # PRINT ERROR MESSAGE HERE
            pass

        # Decode the 64 bit string into 32 bit
        ImageData = base64.b64decode(ImageData)
        with open('picture_out.png', 'wb') as f:
            f.write(ImageData)

