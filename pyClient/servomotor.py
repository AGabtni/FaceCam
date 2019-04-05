import sys
import RPi.GPIO as GPIO
from time import sleep
GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
#GPIO.setup(2, GPIO.IN) 
GPIO.setup(3, GPIO.OUT)
GPIO.setup(5,GPIO.OUT)
 
pwm=GPIO.PWM(3, 50)
pwm2 = GPIO.PWM(5, 50)
pwm.start(0)
pwm2.start(0)
def SetAngle(angle):
    duty = angle / 18 + 2
    GPIO.output(3, True)
    pwm.ChangeDutyCycle(duty)
    sleep(1)
    GPIO.output(3, False)
    pwm.ChangeDutyCycle(0)
    
def SetAngle2(angle):
    duty = angle / 18 + 2
    GPIO.output(5, True)
    pwm2.ChangeDutyCycle(duty)
    sleep(1)
    GPIO.output(5, False)
    pwm2.ChangeDutyCycle(0)

if(len(sys.argv)>2):
    SetAngle(int(sys.argv[1]))
    SetAngle2(int(sys.argv[2]))


pwm.stop()
pwm2.stop()
GPIO.cleanup()