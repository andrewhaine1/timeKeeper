from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit, Layout, Field, Div
from django import forms


class NotesForm(forms.Form):

    title = forms.CharField(widget=forms.TextInput(
        attrs={'placeholder': 'Your note title', 'autocomplete': 'off', 'css': 'form-element'}), required=False, error_messages={'required': 'Please'})
    text = forms.CharField(widget=forms.Textarea(
        attrs={'placeholder': 'Your note details', 'autocomplete': 'off'}), required=False, error_messages={'required': 'Please'})

    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_method = 'post'
        self.helper.show_errors = True
        self.helper.error_text_inline = False
        self.helper.form_id = 'id-noteform'
        self.helper.form_class = 'form-style'
        self.helper.add_input(Submit('submit', 'Submit', style="width: 100%;"))

        # self.helper.layout = Layout(
        #     Div(Field('title', style=""), css_class='form-element'),
        # )
        # self.helper.layout = Layout(
        #     Div(Field('text', style=""), css_class='form-element'),
        # )
        self.helper.layout = Layout(
            Div(Field('title', style=""), css_class='tk-form-element'),
            Div(Field('text', style="resize: none;height:150px;"), css_class='tk-form-element'),
        )

    class Meta:
        pass

    def clean_title(self):
        title = self.cleaned_data['title']
        if title == '':
            raise forms.ValidationError('Please enter a title')
        return title