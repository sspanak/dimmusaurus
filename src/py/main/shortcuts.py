from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.template import loader


def is_request_for_json(request):
    return (request.headers.get('accept') == 'application/json') \
        or (request.headers.get('Accept') == 'application/json') \
        or (request.headers.get('ACCEPT') == 'application/json')


def determine_root_template(request):
    if is_request_for_json(request):
        return 'main/__ajax.html'
    else:
        return 'main/__root.html'


def render_template(request, template, context, language):
    context['root_template'] = determine_root_template(request)

    if is_request_for_json(request):
        template = loader.get_template(template)
        response = JsonResponse({
            'content': template.render(context, request),
            'description': context.get('page', {}).get('description', ''),
            'title': '%s | Dimmu Saurus' % context.get('page', {}).get('title', '')
        })
    else:
        response = render(request, template, context)

    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, language)
    return response


