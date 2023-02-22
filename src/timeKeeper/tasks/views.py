from datetime import datetime, timedelta
from django.http import Http404
from django.template import loader
from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect

from tasks.models import Task
from tasks.forms import TaskForm
from django.contrib.auth.decorators import login_required
from django.utils.timezone import make_aware


# Create your views here.
def index(request):

    template = loader.get_template('tasks/index.html')

    all_tasks = Task.objects.exclude(task_status__status__exact='Closed').order_by('-task_status')
    #all_tasks = Task.objects.all().order_by('-task_status')

    all_tasks_statuses = {}

    for task in all_tasks:
        if str(task.task_status) != 'Closed' and \
                str(task.task_status) != 'New' and \
                str(task.task_status) != 'Completed':
            if task.due_date > make_aware(datetime.now()):
                all_tasks_statuses[task.id] = 'on_time'
            if task.due_date < make_aware(datetime.now()):
                all_tasks_statuses[task.id] = 'over_due'
        else:
            all_tasks_statuses[task.id] = 'n/a'

    context = {
        'all_tasks': all_tasks,
        'all_tasks_statuses': all_tasks_statuses
    }
    return HttpResponse(template.render(context, request))


@login_required(login_url='/accounts/login/')
def create(request):
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        # create a form instance and populate it with data from the request:
        form = TaskForm(request.POST)
        # check whether it's valid:
        if form.is_valid():
            # process the data in form.cleaned_data as required
            # ...
            # redirect to a new URL:

            supplied_due_date = form.cleaned_data['due_date']
            supplied_due_date = make_aware(datetime.strptime(
                str(supplied_due_date), '%Y-%m-%d %H:%M'))

            print(supplied_due_date)

            #supplied_due_date = datetime.strptime(str(supplied_due_date), '%Y-%m-%d %H:%M').strftime('%d/%m/%Y %H:%M')

            print(f'This is the supplied due date: {supplied_due_date}')

            print('VALID')
            print(form.cleaned_data['due_date'])
            print(f'The logged in user is {request.user}')

            result = Task.objects.create(short_description=form.cleaned_data['short_description'],
                                         full_description=form.cleaned_data['full_description'],
                                         due_date=supplied_due_date,
                                         task_status=form.cleaned_data['task_status'],
                                         owner=request.user)

            if (result):
                print(result)
                return HttpResponseRedirect('/tasks')
        else:
            print('form is not valid')

    # if a GET (or any other method) we'll create a blank form
    else:
        form = TaskForm()

    return render(request, 'tasks/create.html', {'form': form})


def details(request, task_id):
    try:
        task = Task.objects.get(pk=task_id)
        template = loader.get_template('tasks/details.html')
        context = {
            'task': task,
        }
    except task.DoesNotExist:
        raise Http404("Task does not exist")

    return HttpResponse(template.render(context, request))


@login_required(login_url='/accounts/login/')
def edit(request, task_id):
    try:

        task = Task.objects.get(pk=task_id)

        # if this is a POST request we need to process the form data
        if request.method == 'GET':
            try:

                form = TaskForm()

                form.fields['short_description'].initial = task.short_description
                form.fields['full_description'].initial = task.full_description
                form.fields['task_status'].initial = task.task_status
                
                aware_date = task.due_date
                aware_date += timedelta(hours=2)

                date = str(aware_date).split(' ')[0]
                time = str(aware_date).split(' ')[1]
                time = time.rsplit(':', 2)[0]

                form.fields['due_date'].initial = f'{date} {time}'

                template = loader.get_template('tasks/edit.html')
                return HttpResponse(template.render({'form': form}, request))

            except task.DoesNotExist:
                raise Http404("Task does not exist")
        else:
            # create a form instance and populate it with data from the request:
            form = TaskForm(request.POST)

            # check whether it's valid:
            if form.is_valid():

                task.short_description = form.cleaned_data['short_description']
                task.full_description = form.cleaned_data['full_description']

                aware_date = form.cleaned_data['due_date']
                aware_date = datetime.strptime(str(aware_date), '%Y-%m-%d %H:%M')

                task.due_date = aware_date
                task.task_status = form.cleaned_data['task_status']
                task.date_updated = make_aware(datetime.now())

                task.save()

                return HttpResponseRedirect('/tasks')
            else:
                print('form is not valid')

    except task.DoesNotExist:
        raise Http404("Task does not exist")


@login_required(login_url='/accounts/login/')
def delete(request, task_id):
    # if this is a POST request we need to process the form data
    if request.method == 'GET':
        task = Task.objects.get(pk=task_id)
        template = loader.get_template('tasks/delete.html')
        context = {
            'task': task,
        }
        return HttpResponse(template.render(context, request))
    else:
        result = Task.objects.get(pk=task_id).delete()

        if (result):
            print(result)
            return HttpResponseRedirect('/tasks')


def get_aware_date(date_to_transform):
    
    date_to_transform = datetime.strptime(str(date_to_transform).split('+')[0], '%Y-%m-%d %H:%M')
    #date_to_transform = make_aware(date_to_transform)
    
    print(date_to_transform)
    
    return date_to_transform