import { Star } from "lucide-react";
import { testimonials } from "../constant";

export default function TestimonialsGrid() {
  return (
    <div className="container px-4 mx-auto">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-gray-50 p-8 rounded-lg h-full min-h-[360px] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
          >
            <div className="flex items-center mb-6">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="object-cover w-16 h-16 mr-4 rounded-full"
              />
              <div>
                <div className="flex text-[#ff6b00] mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <div className="mt-2 text-xl font-bold text-gray-900">
                  {testimonial.name}
                </div>
                <div className="text-sm text-gray-500">
                  {testimonial.location}
                </div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </div>
            </div>
            <p className="text-base sm:text-[1.1rem] leading-relaxed text-gray-700">
              "{testimonial.text}"
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
