#!/usr/bin/env sh

set -e

yarn docs:build

cd docs/.vuepress/dist

git init
git add -A
git commit -m 'deploy'

git push -f https://$ACCESS_TOKEN@github.com/vue-mini/vue-mini.github.io.git master

cd -
