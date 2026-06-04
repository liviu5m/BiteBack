import { ArrowLeft } from "lucide-react"
import BodyLayout from "../layouts/BodyLayout"

const Cook = () => {
  return (
    <BodyLayout>
      <div className="min-h-screen w-[calc(100vw-350px)] p-6 flex justify-center items-start gap-10">
        <div className="flex gap-5">
          <div className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow text-[#1E4D3B] flex items-center justify-center">
            <ArrowLeft className="text-xl" />
          </div>
          <div>
            <h1 className="text-[#1E4D3B] font-bold text-4xl">Save My Fridge</h1>
            <p className="text-gray-500">Using: Ribeye Steak, Heavy Cream</p>
          </div>
        </div>
      </div>
    </BodyLayout >

  )
}

export default Cook
