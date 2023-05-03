echo ""
echo "Adding change and pushing into github"
git add -A
git commit -m $1
git push origin master

echo ""
echo "Deploy changes on: https://dashboard.render.com/web/srv-ch948crhp8u0vh9p3r90/deploys/dep-ch948d3hp8u0vh9p3srg"
echo ""
echo "Access webapp on: https://jb-crypto-portfolio.onrender.com/"
echo ""