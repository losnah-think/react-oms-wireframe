import React from 'react'

const TemplateList: React.FC = () => {
  return (
    <div>
      <h3 className="font-medium mb-2">Templates</h3>
      <ul className="space-y-2 text-sm">
        <li className="p-2 bg-gray-50 rounded">Default - 1up</li>
        <li className="p-2 bg-gray-50 rounded">Small Label</li>
      </ul>
    </div>
  )
}

export default TemplateList
