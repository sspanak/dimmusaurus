from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.template import loader
from django.utils.translation import gettext_lazy, override as translation_override


def is_request_for_json(request):
    return (request.headers.get('accept') == 'application/json') \
        or (request.headers.get('Accept') == 'application/json') \
        or (request.headers.get('ACCEPT') == 'application/json')


def determine_root_template(request):
    if is_request_for_json(request):
        return 'main/__ajax.html'
    else:
        return 'main/__root.html'


def get_language_links(context, language_list):
    for lang, lang_name in language_list:
        with translation_override(lang):
            url = '%s/%s%s%s' % (
                gettext_lazy(context['page'].get('base_url', '')),
                gettext_lazy(context['page'].get('url', '')),
                gettext_lazy(context['page'].get('url_slug', '')),
                gettext_lazy(context['page'].get('url_slug_operation', ''))
            )

            yield {
                'language_code': lang,
                'language_name': lang_name,
                'url': url
            }


def render_template(request, template, context, language):
    context['root_template'] = determine_root_template(request)
    context['language_urls'] = list(get_language_links(context, settings.LANGUAGES))

    if is_request_for_json(request):
        template = loader.get_template(template)
        response = JsonResponse({
            'content': template.render(context, request),
            'description': context.get('page', {}).get('description', ''),
            'title': '%s | Dimmu Saurus' % context.get('page', {}).get('title', ''),
            'urls': context['language_urls']
        })
    else:
        response = render(request, template, context)

    response.set_cookie(settings.LANGUAGE_COOKIE_NAME, language)
    return response
