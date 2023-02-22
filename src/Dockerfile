# pull the official base image
FROM 995387998854.dkr.ecr.af-south-1.amazonaws.com/python:3.10.6-alpine

# set work directory
WORKDIR /usr/src/app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SUPERUSER_EMAIL 'admin@timekeeper.io'
ENV DJANGO_SUPERUSER_USERNAME 'timeadmin'
ENV DJANGO_SUPERUSER_PASSWORD 'TimeAdmin!10'

ENV HTTP_PROXY http://proxyo.fnb.co.za:8080
ENV HTTPS_PROXY http://proxyo.fnb.co.za:8080
ENV NO_PROXY localhost,127.0.0.1,*.fnb.co.za

# install dependencies
RUN pip install --upgrade pip 
COPY ./requirements.txt /usr/src/app
RUN pip install -r requirements.txt

# copy project
COPY ./timeKeeper .
RUN python manage.py migrate
RUN python manage.py createsuperuser --noinput

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]