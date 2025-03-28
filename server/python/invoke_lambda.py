import boto3
import base64
import json
import sys

def invoke_lambda(image_base64, bill_type):
    lambda_client = boto3.client('lambda', region_name='eu-north-1')
    payload = {
        'bill_type': bill_type,
        'image': image_base64
    }
    response = lambda_client.invoke(
        FunctionName='BillProcessor',
        InvocationType='RequestResponse',
        Payload=json.dumps(payload)
    )
    response_payload = json.loads(response['Payload'].read().decode('utf-8'))
    if 'body' in response_payload and isinstance(response_payload['body'], str):
        response_payload['body'] = json.loads(response_payload['body'])
    return response_payload

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(json.dumps({"statusCode": 400, "body": {"error": "Usage: python invoke_lambda.py <bill_type> <base64_file_path>"}}))
        sys.exit(1)

    bill_type = sys.argv[1]
    base64_file_path = sys.argv[2]

    try:
        with open(base64_file_path, 'r') as file:
            image_base64 = file.read().strip()
        print("Image Base64 length:", len(image_base64))
        print("Base64 snippet (start):", image_base64[:50])
        print("Base64 snippet (end):", image_base64[-50:])
        base64.b64decode(image_base64)
        result = invoke_lambda(image_base64, bill_type)
        print(json.dumps({"statusCode": 200, "body": result}))
    except Exception as e:
        print("Error in Python script:", str(e), file=sys.stderr)
        print(json.dumps({"statusCode": 500, "body": {"error": str(e)}}))
        sys.exit(1)