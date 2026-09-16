import os
from azure.cognitiveservices.vision.computervision import ComputerVisionClient
from azure.cognitiveservices.vision.computervision.models import VisualFeatureTypes
from msrest.authentication import CognitiveServicesCredentials
from io import BytesIO

def get_cv_client():
    key = os.getenv("AZURE_CV_KEY")
    if os.getenv("USE_OFFLINE_CV", "false").lower() == "true":
        endpoint = "http://azure-cv:5000"
    else:
        endpoint = os.getenv("AZURE_CV_ENDPOINT", "")
        if endpoint.endswith("/"):
            endpoint = endpoint[:-1]
    return ComputerVisionClient(endpoint, CognitiveServicesCredentials(key))

def analyze_image(image_bytes: bytes) -> list:
    client = get_cv_client()
    stream = BytesIO(image_bytes)
    result = client.analyze_image_in_stream(
        stream,
        visual_features=[VisualFeatureTypes.tags]
    )
    tags = [tag.name for tag in result.tags if tag.confidence > 0.5]
    return tags
