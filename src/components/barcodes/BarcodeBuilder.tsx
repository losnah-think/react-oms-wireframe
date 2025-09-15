import React from 'react'

const Sidebar: React.FC = () => {
  return (
    <div>
      <h2 className="font-medium mb-2">Components</h2>
      <ul className="space-y-2 text-sm text-gray-700">
        <li>Barcode</li>
        <li>Text</li>
        <li>Image</li>
      </ul>
    </div>
  )
}

const Preview: React.FC = () => {
  return (
    <div className="h-96 flex items-center justify-center text-gray-400">Preview canvas</div>
  )
}

const Properties: React.FC = () => {
  return (
    <div>
      <h3 className="font-medium mb-2">Properties</h3>
      <div className="text-sm text-gray-600">Select an item to edit its properties.</div>
    </div>
  )
}

const BarcodeBuilder = {
  Sidebar,
  Preview,
  Properties
}

export default BarcodeBuilder
