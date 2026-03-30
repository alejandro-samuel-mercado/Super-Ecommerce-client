with open('/home/algus/Escritorio/SUPER X E COMMERCE/Super-Ecommerce-client/src/app/cart/page.tsx', 'r') as f:
    lines = f.readlines()

# Part before CartContent
page_lines = lines[:108]
# CartContent function
content_lines = lines[108:]

with open('/home/algus/Escritorio/SUPER X E COMMERCE/Super-Ecommerce-client/src/app/cart/CartContent.tsx', 'w') as f:
    # We need imports in CartContent too
    f.writelines(page_lines[:94])
    f.writelines(content_lines)

with open('/home/algus/Escritorio/SUPER X E COMMERCE/Super-Ecommerce-client/src/app/cart/page.tsx', 'w') as f:
    f.writelines(page_lines[:94])
    f.write("\nimport dynamic from 'next/dynamic';\n")
    f.write("const CartContent = dynamic(() => import('./CartContent'), { ssr: false });\n\n")
    f.writelines(page_lines[94:])
