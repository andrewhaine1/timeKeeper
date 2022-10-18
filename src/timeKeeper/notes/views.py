from django.http import HttpResponse
from django.template import loader
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect

from notes.forms import NotesForm
from notes.models import Note

# Create your views here.
def index(request):
    template = loader.get_template('notes/index.html')

    notes = Note.objects.all()
    context = {
        'message': "Lets get some notes here",
        'notes': notes
    }
    return HttpResponse(template.render(context, request))

@login_required(login_url='/accounts/login/')
def create(request):
    # if this is a POST request we need to process the form data
    if request.method == 'POST':
        
        # create a form instance and populate it with data from the request:
        form = NotesForm(request.POST)
        
        # check whether it's valid:
        if form.is_valid():
            # process the data in form.cleaned_data as required
            # ...
            # redirect to a new URL:

            title = form.cleaned_data['title']
            text = form.cleaned_data['text']

            result = Note.objects.create(title=title, text=text)

            if (result):
                return HttpResponseRedirect('/notes')
        else:
            print('form is not valid')

    # if a GET (or any other method) we'll create a blank form
    else:
        form = NotesForm()

    return render(request, 'notes/create.html', {'form': form})

def details(request, task_id):
    pass

@login_required(login_url='/accounts/login/')
def edit(request, task_id):
    pass

@login_required(login_url='/accounts/login/')
def delete(request, task_id):
    pass

def get_aware_date(date_to_transform):
    pass