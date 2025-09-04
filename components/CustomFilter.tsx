"use client"

import React from 'react'

type CustomFilterProps = {
  title: string;
}

const CustomFilter = ({ title }: CustomFilterProps) => {
  return (
    <div className="custom-filter__btn">
      <button className="px-4 py-2 bg-white rounded-md border">{title}</button>
    </div>
  )
}

export default CustomFilter
