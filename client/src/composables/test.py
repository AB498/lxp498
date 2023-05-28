def build_object(data):
    result = {}

    for key, value in data.items():
        keys = key.split('.')  # Split the key by '.'

        # Iterate over the keys to create nested objects or arrays
        temp = result
        for i, k in enumerate(keys):
            if k.startswith('__'):  # Handle array elements
                index = int(k[2:])  # Extract the index
                if i == len(keys) - 1:
                    if k in temp:
                        temp[k].append(value)
                    else:
                        temp[k] = [value]
                else:
                    if k in temp:
                        temp = temp[k]
                    else:
                        temp[k] = [{}]
                        temp = temp[k][0]
            else:  # Handle nested objects
                if k not in temp:
                    temp[k] = {}
                temp = temp[k]

        if isinstance(temp, list):
            temp.append(value)
        else:
            temp[keys[-1]] = value

    return result

# Given input
data = {
    'foo.bar.r': 'baz',
    'hello.__0': 'world1',
    'hello.__1': 'world2'
}

result = build_object(data)
print(result)
