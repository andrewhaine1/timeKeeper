from django import template

register = template.Library()

@register.filter
def previouspath(value):
    values_count = len(value.split("/")) -3
    previous = value.split("/")[1]
    print(value.split("/"))
    return previous