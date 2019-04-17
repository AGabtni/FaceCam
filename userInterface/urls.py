from django.urls import path
from . import views
from django.urls import include

urlpatterns = [
    path('', views.index, name='index'),
    path('livestream', views.livestream, name='livestream'),
    path('userInfo', views.userInfo, name='userInfo'),
    path('user_login', views.user_login, name='user_login'),
    path('stream_view',views.stream_view, name='stream_view'),
    path('recognWoPy',views.recognWoPy, name='recognWoPy'),
    path('FrameProcess', views.FrameProcess, name='FrameProcess'),
    path('add_visitor', views.add_visitor, name='add_visitor'),

]