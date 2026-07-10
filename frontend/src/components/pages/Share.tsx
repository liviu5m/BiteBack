import { Plus } from "lucide-react"
import BodyLayout from "../layouts/BodyLayout"

const Share = () => {
  return (
    <BodyLayout>
      <div className="min-h-screen w-[calc(100vw-350px)] p-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-emerald-900 text-4xl font-bold mt-5">Community Share</h1>
            <p className="text-lg text-gray-600">Rescue food from neighbors nearby.</p>
          </div>
          <button className="bg-emerald-900 text-white font-semibold px-5 py-3 rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:bg-emerald-800">
            <Plus />
            <span>List Item</span>
          </button>
        </div>
      </div>
    </BodyLayout >
  )
}

export default Share
