import json
import h5py
from urllib.request import urlopen


market_data = {}
timeframe = ['weekly',
             'annual',
             'day']

indexes = ['INDEX_GDAXI',
           'INDEX_GSPC',
           'INDEX_VIX',
           'INDEX_N225',
           'INDEX_SSEC',
           'INDEX_NY',
           'INDEX_STOXX50E']


def getDataFromURL():
    for time in timeframe:
        for index in indexes:
            url = ('https://www.quandl.com/api/v3/datasets/YAHOO/' + index + '.json'
                   '?auth_token=sHWotNFa5Mp9tci_Ee23')
            print('Getting data from ' + index + ' timeframe ' + time)
            if time != 'day':
                url += '&collapse=' + time

            file_handle = urlopen(url)
            file_result = file_handle.read()
            data = json.loads(file_result.decode('utf-8'))
            daily_data = data.get('dataset').get('data')
            with open(index + '-' +  time + '.json', 'w') as f:
                json.dump(daily_data,f)
            market_data[index] = daily_data

def getDataFromFile():
    max_size = 0
    table = {}
    for index in indexes:
        with open(index + '.json', 'r') as f:
            data = json.load(f)
        
        market_data[index] = data

        if len(data) >= max_size:
            max_size = len(data)

    for counter in range(0,max_size):
        line = []
        ind = 0
        for index in indexes:
            data = market_data[index]
            if len(data) > counter:
                line.append(data[counter])
            else:
                line.append([])
            ind = ind + 1
        
        table[counter] = line

    with open('result.json', 'w') as f:
        json.dump(table,f,indent=4)
    
getDataFromURL()
# getDataFromFile()

