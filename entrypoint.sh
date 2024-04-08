#!/bin/bash

if [ -z "$DEBUG" ]; then
    echo "Please set debug"
    exit 1
fi

if ["$DEBUG" = 1 ]; then
    npm run dev
else
    npm start
fi