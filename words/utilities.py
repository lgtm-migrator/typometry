# https://stackoverflow.com/questions/46915495/normalization-vs-numpy-way-to-normalize
def normalize_list(vals):
    max_val = max(vals)
    min_val = min(vals)
    for i in range(len(vals)):
        vals[i] = (vals[i] - min_val) / (max_val - min_val)
    return vals
