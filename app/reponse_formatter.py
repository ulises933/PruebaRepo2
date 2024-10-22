from dicttoxml import dicttoxml
from starlette.responses import Response


def format_response(request, data):
    accept_header = request.headers.get("Accept")
    if "application/xml" in accept_header:
        xml_data = dicttoxml(data)
        return Response(content=xml_data, media_type="application/xml")
    else:
        return data  # Default to JSON
