import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { testimonials } from "../constant";

export default function TestimonialsSlider() {
  return (
    <div className="relative group">
      <div className="swiper-button-prev absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 bg-[#ff6b00] p-3 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:bg-[#ff6b00]/90 hover:scale-110 hover:shadow-xl">
        <ChevronLeft className="w-8 h-8 text-white" />
      </div>

      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={32}
        slidesPerView={1}
        pagination={{ clickable: true }}
        navigation={{
          prevEl: ".swiper-button-prev",
          nextEl: ".swiper-button-next",
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        speed={500}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
        className="testimonials-swiper"
      >
        {testimonials.map((testimonial, index) => (
          <SwiperSlide key={index}>
            <div className="bg-gray-50 p-8 rounded-lg h-full min-h-[360px]">
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
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
              <p className="mb-4 text-gray-600">"{testimonial.text}"</p>
              <div className="text-sm text-gray-500">
                {testimonial.location}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="swiper-button-next absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 bg-[#ff6b00] p-3 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:bg-[#ff6b00]/90 hover:scale-110 hover:shadow-xl">
        <ChevronRight className="w-8 h-8 text-white" />
      </div>
    </div>
  );
}
