# logger
Logger Service

- Pre-requisite: node
- Clone the branch
- run npm install
- run node generate-log.js
- Test http://localhost:8000/ to see if service is up and running
- REST end-points:
- /log-info : POST 
  - Request Sample:
  ```
    {
    "user": "Monica",
    "source": "id",
    "type": "normal", //(normal/error)
    "message": "message here"
   }
  ```
- /create-report : POST
  - Request Sample:
  ```
    {
      "user": "abc",
      "report": "def",
      "content": "<h1>Hello</h1>" //html content
    }
   ```
- read-report : POST
  - Request Sample:
  ```
  {
    "user": "abc",
    "report": "def"
  }
  ```
- /zip-log : POST
  - Request Sample:
  ```
    {
      "user": "Monica"
    }
    ```
