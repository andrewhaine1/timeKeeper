
# pull the official base image
FROM python:3.10.6-alpine

# set work directory
WORKDIR /usr/src/app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DJANGO_SUPERUSER_EMAIL 'admin@timekeeper.io'
ENV DJANGO_SUPERUSER_USERNAME 'timeadmin'
ENV DJANGO_SUPERUSER_PASSWORD 'TimeAdmin!10'

#ENV HTTP_PROXY ''
#ENV HTTPS_PROXY ''
#ENV NO_PROXY localhost,127.0.0.1,

# install dependencies
RUN pip install --upgrade pip 
COPY ./requirements.txt /usr/src/app
RUN pip install -r requirements.txt

# copy project
COPY ./timeKeeper .
COPY ./seed .
RUN python manage.py migrate
RUN python manage.py createsuperuser --noinput
RUN python manage.py loaddata task_statuses.json

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
