import { ArrowLeft, BadgeIcon, Bookmark, CheckCircle, CheckIcon, ChefHat, RefreshCcw, ShoppingBag, Sparkles, SquareCheck, UtensilsCrossed, Zap, ZapIcon } from "lucide-react"
import BodyLayout from "../layouts/BodyLayout"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getFoodByItems, getItemsByIds } from "@/api/item"
import { useAppContext } from "@/lib/AppProvider"
import type { FridgeItem } from "@/lib/Types"
import { useState } from "react"
import { motion } from "framer-motion";
import { RecipeCard } from "../elements/RecipeCard"
import Loader from "../elements/Loader"
import SmallLoader from "../elements/SmallLoader"
import { findRecipeByUserId } from "@/api/recipe"
import { getJobStatus } from "@/api/job"
import SkeletonLoader from "../elements/SkeletonLoader"

const Cook = () => {
  const { checkedItems, user, cookTab: tab, setCookTab: setTab } = useAppContext();
  const { data: items, isLoading: isItemsLoading } = useQuery({
    queryKey: ["items-ids"],
    queryFn: () => getItemsByIds(Object.keys(checkedItems))
  })

  const { data: recipes } = useQuery({
    queryKey: ["get-recipes", user.id],
    queryFn: () => findRecipeByUserId()
  })

  const checkedKeys = Object.keys(checkedItems);
  const hasItemsSelected = checkedKeys.length > 0;
  const itemsCacheKey = [...checkedKeys].sort().join(",");
  const { data: foods, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["select-food", itemsCacheKey, tab],
    queryFn: async () => {
      const sessionKey = `biteback-${tab}-recipes:${itemsCacheKey}`;
      const cached = sessionStorage.getItem(sessionKey);
      if (cached) return JSON.parse(cached);

      const { job_id } = await getFoodByItems(checkedKeys, tab);
      if (!job_id) return null;
      while (true) {
        const job = await getJobStatus(job_id);
        console.log(job);

        if (job.status === "COMPLETED") {
          sessionStorage.setItem(sessionKey, JSON.stringify(job.data));
          if (job.data.length == 0) refetch()
          return job.data;
        }
        if (job.status === "FAILED") {
          refetch()
          throw new Error(job.error);
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    },
    enabled: hasItemsSelected,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
  })



  const handleRefresh = async () => {
    const sessionKey = `biteback-${tab}-recipes:${itemsCacheKey}`;
    sessionStorage.removeItem(sessionKey);
    await refetch();
  }
  return isItemsLoading ? <Loader /> : (
    <BodyLayout>
      <div className="min-h-screen w-[calc(100vw-350px)] flex items-start gap-10 py-20 px-60 flex-col">

        <div className="flex gap-5">
          <Link to={"/dashboard"} className="w-12 h-12 rounded-full bg-white border border-gray-200 shadow text-[#1E4D3B] flex items-center justify-center">
            <ArrowLeft className="text-xl" />
          </Link>
          <div>
            <h1 className="text-[#1E4D3B] font-bold text-4xl">Save My Fridge</h1>
            <p className="text-gray-500 mt-2">
              {!items || items.length === 0 ? "Select some food in order to proceed" : `Using: ${items.map((item: FridgeItem) => item.name).join(', ')} `}
            </p>
          </div>
        </div>

        <div className="w-full space-y-4">
          <div className="flex justify-end">
            <button
              onClick={handleRefresh}
              disabled={isLoading || isRefetching}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors focus:outline-none disabled:opacity-50"
            >
              <RefreshCcw className={`w - 4 h - 4 ${isRefetching ? 'animate-spin' : ''} `} />
              {isRefetching ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setTab('ready')}
              className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 text-left cursor-pointer focus:outline-none ${tab === 'ready'
                ? 'bg-[#1e4632] border-[#1e4632] text-white shadow-md'
                : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300'
                } `}
            >
              <div className="flex items-start gap-3">
                <CheckCircle className={`w-5 h-5 mt-0.5 ${tab === 'ready' ? 'text-white' : 'text-gray-500'} `} />
                <div>
                  <h3 className="font-bold text-lg leading-tight">Ready to cook</h3>
                  <p className={`text-sm mt-0.5 ${tab === 'ready' ? 'text-emerald-100' : 'text-gray-500'} `}>
                    No shopping needed
                  </p>
                </div>
              </div>
              <span className="text-4xl font-serif font-bold px-2">
                {tab == "ready" ? foods && foods.length : <UtensilsCrossed className="w-8 h-8" />}
              </span>
            </button>

            <button
              onClick={() => setTab('missing')}
              className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-200 text-left cursor-pointer focus:outline-none ${tab === 'missing'
                ? 'bg-[#1e4632] border-[#1e4632] text-white shadow-md'
                : 'bg-white border-gray-200 text-gray-800 hover:border-gray-300'
                } `}
            >
              <div className="flex items-start gap-3">
                <ShoppingBag className={`w-5 h-5 mt-0.5 ${tab === 'missing' ? 'text-white' : 'text-gray-500'} `} />
                <div>
                  <h3 className="font-bold text-lg leading-tight">Need a few things</h3>
                  <p className={`text - sm mt - 0.5 ${tab === 'missing' ? 'text-emerald-100' : 'text-gray-500'} `}>
                    Missing 1–2 items (with swaps)
                  </p>
                </div>
              </div>
              <span className="text-4xl font-serif font-bold px-2">
                {tab == "missing" ? foods && foods.length : <UtensilsCrossed className="w-8 h-8" />}
              </span>
            </button>
          </div>

          <button
            onClick={() => setTab('saved')}
            className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border transition-all duration-200 font-medium cursor-pointer focus:outline-none ${tab === 'saved'
              ? 'bg-[#1e4632] border-[#1e4632] text-white shadow-sm'
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              } `}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved recipes ({recipes ? recipes.length : 0})</span>
          </button>
        </div>
        <div className="flex items-center justify-center w-full">
          {tab == "ready" || tab == "missing" ?
            isLoading && hasItemsSelected ? <SkeletonLoader /> :
              <div className="flex flex-col gap-8">
                {!foods && <p className="text-xl font-semibold text-center">No Foods available</p>}
                {foods && foods.map((food, index) => <RecipeCard key={index} recipe={food} recipes={recipes} />)}
              </div>
            :
            <div className="flex flex-col gap-8">
              {recipes.length == 0 && <p className="text-lg font-semibold">No saved recipe, visit some and save them.</p>}
              {recipes.map((recipe, index) => <RecipeCard key={index} recipe={{ ...recipe, missing_ingredients: JSON.parse(recipe.missing_ingredients), used_ingredients: JSON.parse(recipe.used_ingredients) }} recipes={recipes} />)}
            </div>
          }
        </div>
      </div>
    </BodyLayout >
  )
}

export default Cook
