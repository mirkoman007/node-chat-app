const socket=io()

//Elements
const messageForm=document.querySelector('#message-form')
const messageFormInput=messageForm.querySelector('#msg')
const messageFormButton=messageForm.querySelector('button')
const sendLocationButton=document.querySelector('#send-location')
const messages=document.querySelector('#messages')

//Templetes
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
    const newMessage=messages.lastElementChild

    const newMessageStyle=getComputedStyle(newMessage)
    const newMessageMargin=parseInt(newMessageStyle.marginBottom)
    const newMessageHeight=newMessage.offsetHeight+newMessageMargin

    const visibleHeight=messages.offsetHeight

    const containterHeight=messages.scrollHeight

    const scrollOffset=messages.scrollTop+visibleHeight

    if(containterHeight-newMessageHeight<=scrollOffset){
        messages.scrollTop=messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('HH:mm')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('HH:mm')
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    messageFormButton.setAttribute('disabled','disabled')
    const msg=e.target.elements.msg.value.trim()

    socket.emit('sendMessage',msg,(error)=>{
        messageFormInput.value=''
        messageFormInput.focus()
        messageFormButton.removeAttribute('disabled')
        if(error){
            return console.log(error)
        }
        console.log('Message delivered!')
    })
        
})


sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser.')
    }
    sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            console.log('Location shared!')
            sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', {username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})