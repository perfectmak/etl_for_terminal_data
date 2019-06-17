# Ingesting Terminals Public Data Task
[![Build Status](https://travis-ci.org/perfectmak/etl_for_terminal_data.svg?branch=master)](https://travis-ci.org/perfectmak/etl_for_terminal_data)

This code is able to ingest
I tried using COPY for the data but there was some cleanup that was required on the data, this extra 
cleanup lead to more time to be used.

I decided to change to bulk inserts instead and process each input before performing bulk inserts