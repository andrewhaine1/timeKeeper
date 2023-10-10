from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit, Layout, Field, Div
from django import forms
from .models import TaskStatus


class TkDateTimeFieldWidget(forms.MultiWidget):

    def __init__(self, attrs=None):

        super().__init__([
            forms.DateTimeInput(attrs={'type': 'date'}),
            forms.DateTimeInput(attrs={'type': 'time'})
        ], attrs)

    def decompress(self, value):
        print(f'This is in value: {value}')
        if value:
            split_value = value.split(' ')
            return split_value
        else:
            return ['', '']


class TkDateTimeField(forms.MultiValueField):

    widget = TkDateTimeFieldWidget

    def __init__(self, *args, **kwargs):

        fields = (
            forms.CharField(),
            forms.CharField()
        )

        super().__init__(fields, *args, **kwargs)

    def compress(self, data_list):
        if len(data_list) > 0:
            return f'{data_list[0]} {data_list[1]}'
        else:
            return ''


class TaskForm(forms.Form):

    short_description = forms.CharField(widget=forms.TextInput(
        attrs={'placeholder': 'Short description', 'autocomplete': 'off', 'css': 'form-element'}), required=False, error_messages={'required': 'Please'})
    full_description = forms.CharField(widget=forms.Textarea(
        attrs={'placeholder': 'Full description', 'autocomplete': 'off'}), required=False, error_messages={'required': 'Please'})
    due_date = TkDateTimeField(required=False)
    task_status = forms.ModelChoiceField(queryset=TaskStatus.objects.all(), initial=1, required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_method = 'post'
        self.helper.show_errors = True
        self.helper.error_text_inline = False
        self.helper.form_id = 'id-taskform'
        self.helper.form_class = 'form-style'
        self.helper.add_input(Submit('submit', 'Submit', style="width: 100%;"))

        self.helper.layout = Layout(
            Div(Field('short_description', style=""), css_class='tk-form-element'),
            Div(Field('full_description', style="resize: none;height:150px;"), css_class='tk-form-element'),
            Div(Field('due_date', style=""), css_class='tk-form-element'),
            Div(Field('task_status', style="width: 100%"), css_class='tk-form-element'),
        )

    class Meta:
        pass

    def clean_short_description(self):
        short_description = self.cleaned_data['short_description']
        if short_description == '':
            raise forms.ValidationError('Please enter a short description')
        return short_description

    def clean_due_date(self):
        due_date = self.cleaned_data['due_date']
        if due_date == None or due_date == '' or '-' not in due_date or ':' not in due_date:
            raise forms.ValidationError('Please select a date and time')
        # if '-' not in due_date or ':' not in due_date:
        #     raise forms.ValidationError('Please select a date and time')
        return due_date

    def clean_task_status(self):
        task_status = self.cleaned_data['task_status']
        if task_status == None:
            raise forms.ValidationError('Please select a task status')
        return task_status
