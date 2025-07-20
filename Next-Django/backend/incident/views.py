from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def submit_incident(request):
    incident = request.data.get('incident')
    model = request.data.get('model')
    threshold = request.data.get('threshold')
    quality_score = request.data.get('qualityScore')

    print("Received incident:", incident, model, threshold, quality_score)

    # (Optionally) Validate and save to DB...

    return Response([{"issue_id": "111",
                     "desc": "xxxxx",
                     "Issue Description": "xxxx xxxx xxxx",
                     "Issue Category": "xxx xxx",
                     "Issue Subcategory": "xxx xxx",
                     "Root Cause Analysis": "xxx xxx xxx",
                     "Resolution": "xxx xxx xxxx xxx",
                    "Resolved By": "abcd", },
                     { "issue_id": "333",
                     "desc": "xxxxx",
                     "Issue Description": "xxxx xxxx xxxx",
                     "Issue Category": "xxx xxx",
                     "Issue Subcategory": "xxx xxx",
                     "Root Cause Analysis": "xxx xxx xxx",
                     "Resolution": "xxx xxx xxxx xxx",
                     "Resolved By": "abcd"
                     }])
