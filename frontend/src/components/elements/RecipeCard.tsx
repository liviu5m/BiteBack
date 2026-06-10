import React from 'react';
import { Clock, Leaf, AlertCircle, Snowflake, ChevronDown, Bookmark, ThumbsDown } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type RecipeData } from "@/lib/Types"
import { deleteRecipeFunc, saveRecipeFunc } from '@/api/recipe';
import { useAppContext } from '@/lib/AppProvider';
interface RecipeCardProps {
  recipe: RecipeData;
  onMarkAsCooked?: () => void;
  recipes: RecipeData[]
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onMarkAsCooked, recipes }) => {
  const queryClient = useQueryClient();
  const { user } = useAppContext();
  const saved = recipes?.find((r) => r.recipe_name === recipe.recipe_name);
  const { mutate: saveRecipe } = useMutation({
    mutationKey: ["save-recipe", recipe.recipe_name],
    mutationFn: () => saveRecipeFunc(recipe),
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["get-recipes", user.id] })
    },
    onError: (err) => {
      console.log(err);
    }
  })

  const { mutate: deleteRecipe } = useMutation({
    mutationKey: ["delete-recipe", recipe.recipe_name],
    mutationFn: (id: number) => deleteRecipeFunc(id),
    onSuccess: (data) => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ["get-recipes", user.id] })
    },
    onError: (err) => {
      console.log(err);
    }
  })



  return (
    <div className=" flex flex-col md:flex-row max-w-3xl bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden font-sans">

      <div className="relative w-full md:w-[40%] min-h-[240px] md:min-h-full bg-gray-100">
        <img
          src={recipe.image_url || "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=600"}
          alt={recipe.recipe_name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-[#4ade80] font-semibold text-xs px-3 py-1.5 rounded-full">
          {recipe.match_percentage}% Match
        </div>
      </div>
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#113a2B] tracking-tight mb-2">
            {recipe.recipe_name}
          </h2>

          <div className="flex items-center gap-3 text-sm text-gray-400 mb-4 font-medium">
            <div className="flex items-center gap-1">
              <Clock size={16} className="text-gray-400" />
              <span>{recipe.prep_time_minutes} min</span>
            </div>
            <span>•</span>
            <span className="bg-[#eef7f4] text-[#2d6a4f] px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {recipe.difficulty}
            </span>
            <span>•</span>
            <span>{recipe.cuisine_tag}</span>
          </div>

          <div className="flex items-start gap-2.5 bg-[#f4faf7] border border-[#e3f4ec] text-[#2d6a4f] p-3 rounded-xl text-sm mb-5 font-medium">
            <Leaf size={18} className="mt-0.5 flex-shrink-0 text-[#2d6a4f]" />
            <p>{recipe.hook_line}</p>
          </div>

          <div className="mb-4">
            <h4 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
              Uses from your fridge
            </h4>
            <div className="flex flex-wrap gap-2">
              {recipe.used_ingredients.map((ing, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full font-medium border border-gray-200">
                  {ing}
                </span>
              ))}
            </div>
          </div>

          {recipe.missing_ingredients.length > 0 && (
            <div className="mb-5">
              <h4 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2">
                Missing
              </h4>
              <div className='flex gap-2'>
                {recipe.missing_ingredients.map((ing, idx) => (
                  <div key={idx} className="inline-flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2.5 max-w-xs">
                    <AlertCircle size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">{ing.name}</p>
                      <p className="text-xs text-gray-400 font-medium">{ing.importance}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-2.5 bg-[#f0f7ff] border border-[#e0effe] text-[#1d4ed8] p-3 rounded-xl text-sm mb-6">
            <Snowflake size={18} className="mt-0.5 flex-shrink-0 text-[#2563eb]" />
            <div>
              <span className="font-bold text-xs tracking-wider uppercase block text-[#1e40af] mb-0.5">
                Preservation Tip
              </span>
              <p className="text-[#1e3a8a] font-medium">{recipe.preservation_tip}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <button className={`p-2.5 ${saved ? "bg-[#1b4332] text-white hover:bg-[#143225]" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"} border cursor-pointer border-gray-200 rounded-xl  transition-all`}
            onClick={() => {
              if (!saved) saveRecipe()
              else deleteRecipe(saved.id)
            }}
          >
            <Bookmark size={18} />
          </button>
          <button
            onClick={onMarkAsCooked}
            className="bg-[#1b4332] hover:bg-[#143225] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Mark as Cooked
          </button>
        </div>

      </div>
    </div >
  );
};
