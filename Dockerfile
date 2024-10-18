FROM python:3.12

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./app /code/app

CMD ["hypercorn", "app.main:app", "--bind", "0.0.0.0:8000"]