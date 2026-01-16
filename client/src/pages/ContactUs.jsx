import React from 'react'
import Navbar from '../components/Navbar'

const ContactUs = () => {
  return (
    <div className='min-h-screen text-default text-gray-700 bg-white'>
      <div className='px-6 md:px-16 lg:px-24 xl:px-32 py-12'>
        <h1 className='text-3xl font-semibold mb-6'>Contact Us</h1>

        <div className='max-w-xl bg-white border border-gray-200 shadow-sm rounded-md p-6'>
          <div className='mb-4'>
            <h2 className='text-lg font-medium'>Website Owner</h2>
            <p>Raiyan Chowdhury</p>
          </div>

          <div className='mb-4'>
            <h2 className='text-lg font-medium'>Email</h2>
            <p>raiyanchowdhury11@gmail.com</p>
          </div>

          <div className='mb-4'>
            <h2 className='text-lg font-medium'>Phone</h2>
            <p>01608385116</p>
          </div>

          <div className='mb-4'>
            <h2 className='text-lg font-medium'>Address</h2>
            <p>Dhaka, Ashkona, Bangladesh</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactUs
