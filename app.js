const express = require('express')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const path = require('path')


const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'ktSolutions.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000')
    })
  } catch (e) {
    console.log('DB Error:${e.message}')
    process.exit(1)
  }
}
initializeDBAndServer()

//get users
app.get('/users', async (request, response) => {
  const getUsersQuery = `SELECT *
  FROM User;`
  const usersList = await db.all(getUsersQuery)
  response.send(usersList)
})

// get devices
app.get('/devices', async (request, response) => {
  const getDevicesQuery = `SELECT * FROM Device;`
  const devicesArray = await db.all(getDevicesQuery)
  response.send(devicesArray)
})

//add user
app.post('/users', async (request, response) => {
  const userDetails = request.body
  const {userId, userName, userPwd} = userDetails
  const addUserQuery = `
  INSERT INTO User(user_id, user_name,user_pwd)
    VALUES(
        ${userId},
        '${userName}',
        '${userPwd}'
      );`
  const addUser = await db.run(addUserQuery)
  response.send('User Successfully Added')
})

//create device
app.post('/devices', async (request, response) => {
  const deviceDetails = request.body
  const {deviceId, allotedToUser, light, fan, mis} = deviceDetails
  const addUserQuery = `
  INSERT INTO Device(device_id, alloted_to_user,light,fan,mis)
    VALUES(
        ${deviceId},
        ${allotedToUser},
        ${light},
        ${fan},
        ${mis}
      );`
  const addUser = await db.run(addUserQuery)
  response.send('Device Successfully Added')
})

//allote device to user
app.put('/devices/:deviceId/', async (request, response) => {
  const {deviceId} = request.params
  const requestBody = request.body
  const {allotedToUser} = requestBody

  const updateDeviceQuery = `
  UPDATE Device 
  SET alloted_to_user = ${allotedToUser}
  WHERE device_id = ${deviceId};
  `
  await db.run(updateDeviceQuery)
  response.send('Updated')
})

//get devices with id
app.get('/users/:userId/', async (request, response) => {
  const {userId} = request.params
  const getUserDevicesQuery = `SELECT *
  FROM Device
  WHERE alloted_to_user=${userId};`
  const userDevices = await db.all(getUserDevicesQuery)
  response.send(userDevices)
})

//get rooms
app.get('/rooms', async (request, response) => {
  const getRoomsQuery = `SELECT *
  FROM Rooms;`
  const roomsList = await db.all(getRoomsQuery)
  response.send(roomsList)
})

//create rooms
app.post('/rooms/:userId', async (request, response) => {
  const {userId} = request.params
  const roomDetails = request.body
  const {roomId, deviceId, roomName} = roomDetails
  const addRoomQuery = `
  INSERT INTO Rooms(room_id, user_id,device_id,room_name)
    VALUES(
        ${roomId},
        ${userId},
        ${deviceId},
        '${roomName}'
      );`
  const addUser = await db.run(addRoomQuery)
  response.send('Room Successfully Added')
})

// login admin
app.post('/login/admin', async (request, response) => {
  const {adminName, adminPwd} = request.body
  const selectAdminQuery = `SELECT * FROM Admin WHERE admin_name='${adminName}'`
  const dbAdmin = await db.get(selectAdminQuery)
  if (dbAdmin === undefined) {
    response.status(400)
    response.send('Invalid Admin')
  } else {
    const isPasswordMatched = adminPwd === dbAdmin.admin_pwd
    if (isPasswordMatched === true) {
      response.send('Admin Login Success')
    } else {
      response.status(400)
      response.send('Invalid Password')
    }
  }
})

//login user
app.post('/user/login', async (request, response) => {
  const {userName, userPwd} = request.body
  const selectUserQuery = `SELECT * FROM User WHERE user_name='${userName}'`
  const dbUser = await db.get(selectUserQuery)
  if (dbUser === undefined) {
    response.status(400)
    response.send('Invalid User')
  } else {
    const isPasswordMatched = userPwd === dbUser.user_pwd
    if (isPasswordMatched === true) {
      response.send('User Login Success')
    } else {
      response.status(400)
      response.send('Invalid Password')
    }
  }
})
