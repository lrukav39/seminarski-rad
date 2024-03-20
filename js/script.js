
/*  SCALEDRONE SECTION   */

// Scaledrone channel ID and defining users
const CLIENT_ID = '5Cfvbc55xMNhUDIy'

const drone = new ScaleDrone(CLIENT_ID, {
  data: {
    name: getRandomName(),
    color: getRandomColor(),
  },
})

// Array for storing members
let members = []

// connecting to a room
drone.on('open', error => {
  if (error) {
    return console.error(error)
  }
  console.log('Successfully connected to Scaledrone')

  const room = drone.subscribe('observable-room')

  room.on('open', error => {
    if (error) {
      return console.error(error)
    }
    console.log('Successfully joined room')
  })

  // members joining and leaving the room
  room.on('members', m => {
    members = m
    updateMembersDOM()
  })

  room.on('member_join', member => {
    members.push(member)
    updateMembersDOM()
  })

  room.on('member_leave', ({ id }) => {
    const index = members.findIndex(member => member.id === id)
    members.splice(index, 1)
    updateMembersDOM()
  })

  // listening to messages and adding them to .messages 
  room.on('data', (text, member) => {
    if (member) {
      addMessageToListDOM(text, member)
    }
  })
})

// closing connection 
drone.on('close', event => {
  console.log('Connection was closed', event)
})



/* GENERATING RANDOM NAME AND COLOR SECTION */

// randomizing username
function getRandomName() {
  const numbRandom = Math.floor(Math.random() * 100 + 1)
  return 'User_' + numbRandom
}

// randomizing color
function getRandomColor() {
  return '#' + Math.floor(Math.random() * 0xffffff).toString(16)
}



/* DOM SECTION */

const DOM = {
  members: document.querySelector('.members'),
  messages: document.querySelector('.messages'),
  input: document.querySelector('.messageFormInput'),
  form: document.querySelector('.messageForm'),
}

// adding eventListener to form button and function for sending input value
DOM.form.addEventListener('submit', sendMessage)

function sendMessage() {
  const value = DOM.input.value

  if (value === '') {
    return
  }

  DOM.input.value = ''
  drone.publish({
    room: 'observable-room',
    message: value,
  })
}

// function for updating the .members
function updateMembersDOM() {
  DOM.members.innerHTML = `<span class="userHead"> Members online: ${members.length}</span> 
  ${members
    .map(value => {
      return `<span class="userBody" style="color: ${value.clientData.color}">${value.clientData.name}</span>`
    })
    .join('')}`
}

// creating and adding messages
function createMessageElement(text, member) {
  // defining active user and checking the origin of message
  const clientID = drone.clientId
  const messageFromMe = member.id === clientID

  const className = messageFromMe ? 'message currentMember' : 'message'
  const { name, color } = member.clientData

  // adding message text to DOM
  const msg = document.createElement('div')
  msg.className = 'messageText'
  msg.appendChild(document.createTextNode(text))

  // adding message information and date/time
  const profile = document.createElement('div')
  profile.className = 'profile'

  const character = document.createElement('div')
  character.appendChild(document.createTextNode(name))
  character.style.color = color
  character.className = 'name'

  profile.appendChild(character)

  const now = new Date()
  const time = `${now.getHours()}:${now.getMinutes()}`.padStart(2, '0')
  const date = new Intl.DateTimeFormat(navigator.language).format(now)

  // combining all elements into a single message
  const msgDateTime = document.createElement('div')

  msgDateTime.textContent = `${date}, ${time}`
  msgDateTime.classList.add('time-date')
 
  const element = document.createElement('div')
  element.appendChild(profile)
  element.appendChild(msg)
  element.className = className
  element.append(msgDateTime)

  return element
}

// adding a new messages to chat window
function addMessageToListDOM(text, member) {
  
  // auto-scroll to the bottom in message window
  const element = DOM.messages
  const wasTop = element.scrollTop === element.scrollHeight - element.clientHeight
  element.appendChild(createMessageElement(text, member))
  if (wasTop) {
    element.scrollTop = element.scrollHeight - element.clientHeight
  }

}

