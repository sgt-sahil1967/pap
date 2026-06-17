import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <div className="bg-accent/40 py-20">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-primary mb-6">
              Our Story
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Bringing the joy, colors, and rich traditions of India to your little ones' wardrobe.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border space-y-8 text-lg text-foreground leading-relaxed">
            <p>
              Welcome to <strong className="text-primary font-heading font-normal text-2xl">Papillon Ethinics</strong> — a brand born out of love for vibrant Indian textiles and the magic of childhood. 
            </p>
            
            <p>
              We believe that ethnic wear shouldn't just be for special occasions; it should be comfortable, playful, and crafted with care so kids can be kids while wearing them. From twirl-worthy cotton frocks to classic Kurta sets and traditional Paithani pieces, every garment in our collection is thoughtfully designed for babies and toddlers.
            </p>

            <div className="grid md:grid-cols-2 gap-8 my-12">
              <div className="bg-accent/20 p-6 rounded-xl border border-accent">
                <h3 className="font-heading text-2xl text-primary font-bold mb-3">Handcrafted with Love</h3>
                <p className="text-base text-muted-foreground">Every piece is carefully stitched using high-quality fabrics that are gentle on delicate skin, ensuring your little ones stay comfortable all day long.</p>
              </div>
              <div className="bg-accent/20 p-6 rounded-xl border border-accent">
                <h3 className="font-heading text-2xl text-primary font-bold mb-3">Festive Spirit</h3>
                <p className="text-base text-muted-foreground">Our designs celebrate the bright, joyful colors of Indian festivities, making every day feel like a celebration.</p>
              </div>
            </div>

            <p>
              Whether it's a family gathering, a festival, or just a day when your little one wants to feel special, Papillon Ethinics has something perfect waiting for them.
            </p>

            <div className="pt-8 border-t text-center">
              <p className="font-heading text-2xl text-primary italic">
                "Celebrate Childhood with Colors"
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
