from datetime import datetime
from django.http import Http404, HttpResponse
from django.template import loader
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.utils.timezone import make_aware

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

def details(request, note_id):
    pass

@login_required(login_url='/accounts/login/')
def edit(request, note_id):
    try:

        note = Note.objects.get(pk=note_id)

        # if this is a POST request we need to process the form data
        if request.method == 'GET':
            try:

                form = NotesForm()

                form.fields['title'].initial = note.title
                form.fields['text'].initial = note.text

                template = loader.get_template('notes/edit.html')
                return HttpResponse(template.render({'form': form}, request))

            except note.DoesNotExist:
                raise Http404("Note does not exist")
        else:
            # create a form instance and populate it with data from the request:
            form = NotesForm(request.POST)

            # check whether it's valid:
            if form.is_valid():

                note.title = form.cleaned_data['title']
                note.text = form.cleaned_data['text']

                note.date_updated = make_aware(datetime.now())

                note.save()

                return HttpResponseRedirect('/notes')
            else:
                print('form is not valid')

    except note.DoesNotExist:
        raise Http404("Task does not exist")

@login_required(login_url='/accounts/login/')
def delete(request, note_id):
     # if this is a POST request we need to process the form data
    if request.method == 'GET':
        note = Note.objects.get(pk=note_id)
        template = loader.get_template('notes/delete.html')
        context = {
            'note': note,
        }
        return HttpResponse(template.render(context, request))
    else:
        result = Note.objects.get(pk=note_id).delete()

        if (result):
            print(result)
            return HttpResponseRedirect('/notes')