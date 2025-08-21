import json
import functions_framework
import firebase_admin
from firebase_admin import firestore

# firebase_admin.initialize_app()
db = firebase_admin.firestore.client()


@functions_framework.http
def search_jobs(request):
    """
    Args:
        request (flask.Request): The request object, which will have a JSON payload as WebhookRequest:
            https://cloud.google.com/dialogflow/cx/docs/reference/rest/v3/WebhookRequest
            The path request.sessionInfo/parameters/job_field will be used in searching tags in the positions collection.

    Returns:
        job_responses: a string of job responses found from the Firestore,
        with a response structured as a WebhookResponse:
        https://cloud.google.com/dialogflow/cx/docs/reference/rest/v3/WebhookResponse
    """
    # Get the request JSON
    request_json = request.get_json(silent=True)

    # Set default job_field
    job_field = "teaching"

    # Try to access the nested structure safely
    try:
        if (
                request_json and
                'sessionInfo' in request_json and
                'parameters' in request_json['sessionInfo'] and
                'job_field' in request_json['sessionInfo']['parameters']
        ):
            job_field = request_json['sessionInfo']['parameters']['job_field']
    except (KeyError, TypeError) as e:
        print(f"Error accessing job_field from request: {e}")
        print(f"Request JSON structure: {request_json}")
        # job_field remains as default

    # Query the Firestore collection for matching jobs
    matches = db.collection("positions").where(
        filter=firebase_admin.firestore.FieldFilter("tags", "array_contains", job_field)
    ).get()

    # Prepare a response for the agent
    job_responses = []
    for match in matches:
        response_message = {
            "type": "accordion",
            "title": match.get('title'),
            "subtitle": match.get('city'),
            "text": match.get('description'),
            "image": {
                "rawUrl": "https://example.com/images/logo.png"
            }
        }
        job_responses.append(response_message)

    # Structure the response as a WebhookResponse with fulfillment payload
    response_json = {
        "fulfillmentResponse": {
            "messages": [
                {
                    "payload": {
                        "richContent": job_responses
                    }
                }
            ]
        }
    }
    print(response_json)
    return response_json
