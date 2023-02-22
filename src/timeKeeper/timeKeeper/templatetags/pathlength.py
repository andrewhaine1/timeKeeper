from django import template

register = template.Library()

@register.filter
def pathlength(value):
    return len(value.split("/"))