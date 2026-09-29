# For local development outside docker
-  remove the docker container
- Run these commands

```sh
 python -m venv venv
 source venv/bin/activate
    pip install -r requirements.txt

```
3- run the server: python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
