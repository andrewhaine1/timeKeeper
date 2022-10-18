from django import template

register = template.Library()

@register.filter
def slashtoangle(value):
    return value.replace("/"," > ")