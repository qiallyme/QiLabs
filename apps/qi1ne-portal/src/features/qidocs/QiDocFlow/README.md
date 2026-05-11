# QiDocFlow

## Overview

# DocFlow - Document Management API

<div align="center">
    <img src="app/docs/github-banner.png"><br>
</div>

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Swagger](https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white)
![Github Pages](https://img.shields.io/badge/github%20pages-121013?style=for-the-badge&logo=github&logoColor=white)
![GMail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)

DocFlow is a powerful Document Management API designed to streamline document handling, including seamless uploading, downloading, organization, versioning, sharing, and more.

## 😎 Upcoming Updates

- 🟨 Document Interactions - Adding Comments and Tags
- 🟨 Import documents from unread emails
- 🟨 Video Preview
- 🟨 Adding custom metadata fields to document
- 🟨 2-factor authentication
- 🟨 Storage quota per user? (Maybe to enable limit storage per user)
- 🟨 Bulk file importer

## 🚀 Key Features

- 💡 Document Upload and Download
- 💡 Organization and Searching
- 💡 Versioning
- 💡 Sharing
- 💡 Authentication and Authorization
- 💡 Access Control List
- 💡 Deletion and Archiving
- 💡 Document Preview
- 💡 Send file via Email
- 💡 Minio Support—for on-premise object storage


## 📖 API Documentation and Image

Explore the [API Documentation](https://documenter.getpostman.com/view/20984268/2s9YRGxUcp) for detailed information on how to use DocFlow's features.

Details about features and commands can be found [here](app/docs).

Download docker image from [docker-hub](https://hub.docker.com/r/jiisanda/docflow).

Or just run
```commandline
docker pull jiisanda/docflow:1
```

## 🔸 Setup Docflow 

Follow the steps outlined in the [setup.md](app/docs/setup.md) file.

## 🧩 Implementation Detail


| Features                         | Implementation Detail                                            |
|----------------------------------|------------------------------------------------------------------|
| Upload                           | [Detail](https://github.com/jiisanda/docflow#-document-upload)   |
| Download                         | [Detail](https://github.com/jiisanda/docflow#-document-download) |
| Sharing                          | [Detail](https://github.com/jiisanda/docflow#-document-sharing)  |
| Document Preview                 | [Detail](https://github.com/jiisanda/docflow#-document-preview)  |


### 📤 Document Upload

Here's how documents are uploaded in DocFlow:

![upload-document](app/docs/imgs/document/document_upload.png)

For a detailed explanation, visit the [Document Upload Documentation](app/docs/features/upload.md).

### 📥 Document Download

Here's how a user can download a file in DocFlow.

![download-document](app/docs/imgs/document/docflow_download.png)

For detailed explanation, visit the [Document Download Documentation](). 

### 📨 Document Sharing

Learn how to share documents in DocFlow:

![share-document](app/docs/imgs/sharing/document_sharing.png)

For detailed instructions, visit the [Document Sharing Documentation](app/docs/features/sharing.md).

### 👀 Document Preview

Here's how the preview of docs works in DocFlow.

![preview-document](app/docs/imgs/document/document_preview.png)

For detailed instructions, visit the [Document Preview Documentation](app/docs/features/preview.md)

## 📜 License

[![Licence](https://img.shields.io/github/license/Ileriayo/markdown-badges?style=for-the-badge)](./LICENSE)

## 📧 Contact Us

For any questions or support, please [contact](mailto:harshjaiswal2307@gmail.com).

Test DocFlow to manage documents seamlessly!


---

## Setup

# 🚀 Setting up Docflow Locally

Just a 3-step process to get Docflow up and running on your local machine! 🌐

### 1️⃣ Clone the repository

```bash
git clone https://www.github.com/jiisanda/docflow.git
```

### 2️⃣ Configure Your Environment

Start by creating your environment file using the provided [.env.template](https://github.com/jiisanda/docflow/blob/master/.env.template).
This file contains all the necessary environment variables for Docflow. Save it inside the app/ directory.

#### PostgreSQL Setup

Set up your PostgreSQL environment variables:

- `DATABASE_HOSTNAME`: By default, set to `postgres`.
- `POSTGRES_USER`, `POSTGRES_PASSWORD` and `POSTGRES_PORT`:  Enter your PostgreSQL username, password, and port 
(default is `5432`).
- `POSTGRES_DB` and `POSTGRES_DB_TESTS`: Specify your database names (`POSTGRES_DB_TESTS` can be left blank).

#### AWS Setup
For AWS credentials (`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`), follow these steps:

>1. Sign in to the [AWS Management Console]() using your AWS account's root user credentials.
>2. Navigate to Security Credentials and create an access key.
>3. Copy the access key ID and secret key securely.
>4. For S3 bucket setup, refer to creating a [bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/creating-bucket.html).
>
> Source: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_root-user_manage_add-key.html

#### User Environment

Keep `ACCESS_TOKEN_EXPIRE_MIN` and `REFRESH_TOKEN_EXPIRE_MIN` as default. Update the `ALGORITHM` of your choice (e.g., `HS256` or `RS256`).

Generate `JWT_SECRET_KEY` and `JWT_REFRESH_SECRET_KEY` using Python:
```bash
docflow$ python
>> import secrets
>> secrets.token_urlsafe(32)
'some-random-secret-of-length-32'
>> secrets.token_hex(32)
'some-random-secret-of-length-32'
```
#### Email Service

This section explains how to set up the email service using Gmail. Configure the following variables:
```.ignorelang
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL=Your email address used to create the app
APP_PASSWORD=Generate an app password from your Google Account
```

Before starting, ensure you have enabled "Two-Factor Authentication" and "Less secure app access" for your Gmail account.

>For a deeper understanding of environment variables in Python, check out this article: 
>[@dev.to/jiisanda](https://dev.to/jiisanda/how-does-python-dotenv-simplify-configuration-management-3ne6)


### 3️⃣ Run with Docker-Compose

Ensure Docker is installed, then run:

```commandline
docker-compose up --build
```

That's it! Docflow is now running on localhost:8000. 

If you face any issues, contact me I will help you set up or start an EC2 instance for testing docflow.

## ⏭️ Next Step

To test it, use Postman following the steps in 
[postman.md](features/postman.md).
***


---

