# wecabs-backend

# DB:
### 1- USER

      name
      profileImgUrl
      email 
      phone 
      carsBooked
      carsAvailable
      carsDetails
      submittedAt
      password 
      updatedAt
      role
      location
      bookingsCount
      avgRating
            
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
      status
      
### 3- BID

      bidId
      linkedUserId
      linkedUserRating
      linkedBookingId
      amount
      carPlate
      submittedAt 
      updatedAt  
      status 
  
# Api:

## 1- user (db)
```
POST USER - post a new user
GET USER - get details of a specific user
LIST USER - list a user
```
## 2- booking (db)
```
POST BOOKING - for posting booking details
GET BOOKING - for getting details of a specific booking
LIST BOOKING - list all bookings
TODO:  - get list of a) all available bookings (can be filtered by time, location b) bookings of a particular 
```
## 3- bid (db)
```
POST BID
GET BID
LIST BID
```
 
 
SERVERLESS DEPLOY
```
serverless deploy
```
![alt text](./imgs/2.png)
