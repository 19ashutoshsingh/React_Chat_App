import React from 'react'
import { toast, ToastContainer } from 'react-toastify'
import "react-toastify/dist/ReactToastify.css"

function Notification() {
  return (
    <div className='notification'>
      <ToastContainer position="bottom-right" />
    </div>
  )
}

export default Notification
