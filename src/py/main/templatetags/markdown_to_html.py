from django import template
from django.template.defaultfilters import stringfilter
from markdown2 import markdown

register = template.Library()

@register.filter
@stringfilter
def markdown_to_html(value):
    return markdown(value)
