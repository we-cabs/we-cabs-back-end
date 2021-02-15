# wecabs-backend

# DB:
### 1- USER

      fullname 
      email 
      phone 
      carsBooked
      carsAvailable
      carsDetails
      submittedAt 
      updatedAt
            
### 2- BOOKING
        
      bookingId
      pickupPoint
      dropPoint
      pickupTime
      carType
      expiryTime
      distance
      customerDetails
      allotedBid
      
### 3- BID

      bidId
      linkedUserId
      linkedBookingId
      amount
      carPlate
      submittedAt 
      updatedAt   
  
# Api:

## 1- user (db)
```
POST USER
GET USER
LIST USER
```
## 2- booking (db)
```
POST BOOKING
GET BOOKING
LIST BOOKING
```
## 3- bid (db)
```
POST BID
GET BID
LIST BID
```
ENDPOINTS:
```
endpoints:
  POST - https://yo499c2xab.execute-api.us-west-2.amazonaws.com/dev/user
  GET - https://yo499c2xab.execute-api.us-west-2.amazonaws.com/dev/user/{email}
  GET - https://yo499c2xab.execute-api.us-west-2.amazonaws.com/dev/user
  POST - https://yo499c2xab.execute-api.us-west-2.amazonaws.com/dev/booking
  GET - https://yo499c2xab.execute-api.us-west-2.amazonaws.com/dev/booking/{bookingId}
  GET - https://yo499c2xab.execute-api.us-west-2.amazonaws.com/dev/booking
  POST - https://yo499c2xab.execute-api.us-west-2.amazonaws.com/dev/bid
  GET - https://yo499c2xab.execute-api.us-west-2.amazonaws.com/dev/bid/{bidId}
  GET - https://yo499c2xab.execute-api.us-west-2.amazonaws.com/dev/bid

```

# CURL:

## 1- user (db)
POST USER
```
curl -H "Content-Type: application/json" -X POST -d '{"fullname":"Test","email": "test@gmail.com", "password":"12", "phone":"1"}' https://yo499c2xab.execute-api.us-west-2.amazonaws.com/dev/user
```

```
{"message":"Successfully submitted user with email test@gmail.com","userId":"test@gmail.com"}sh-3.2# 
```

GET USER

```
curl https://yo499c2xab.execute-api.us-west-2.amazonaws.com/dev/user/test@gmail.com
```

```
{"password":"12","email":"test@gmail.com","phone":"1","fullname":"Test","submittedAt":1613347705421,"updatedAt":1613347705421}sh-3.2# 
```

LIST USERS

```
curl https://yo499c2xab.execute-api.us-west-2.amazonaws.com/dev/user

```

```
{"users":[{"password":"12","email":"t1est@gmail.com","fullname":"Test","phone":"1"},{"password":"12","email":"test@gmail.com","fullname":"Test","phone":"1"}]}
```

SERVERLESS DEPLOY
```
serverless deploy
```
![alt text](./imgs/2.png)
