import { Link } from "wouter";
import { Instagram, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-16 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="font-heading text-2xl font-bold text-primary block mb-4">
              Papillon Ethinics
            </Link>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Joyful, handcrafted Indian ethnic garments for babies and toddlers. Celebrating childhood with vibrant colors and rich traditions.
            </p>
          </div>
          
          <div>
            <h3 className="font-heading text-lg font-bold text-primary mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-muted-foreground hover:text-primary">Home</Link></li>
              <li><Link href="/collections" className="text-muted-foreground hover:text-primary">Collections</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-heading text-lg font-bold text-primary mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:papillonethinics@gmail.com" className="hover:text-primary">papillonethinics@gmail.com</a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Instagram className="h-5 w-5 text-primary" />
                <a href="#" className="hover:text-primary">@papillonethinics</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>All rights reserved Papillon Ethinics 2024</p>
        </div>
      </div>
    </footer>
  );
}
