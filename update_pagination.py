#!/usr/bin/env python3
import re

with open('nodes/Xibo/Xibo.node.ts', 'r') as f:
    content = f.read()

# Pattern to find getAll operations using xiboApiRequest
pattern = r"(if \(operation === 'getAll'\) \{)\s*((?:const .*?;?\s*)*)\s*(responseData = await xiboApiRequest\(\s*this,\s*'GET',\s*'([^']+)',\s*accessToken,\s*baseUrl,\s*\);)"

def replace_getall(match):
    operation_start = match.group(1)
    existing_vars = match.group(2)
    old_request = match.group(3)
    endpoint = match.group(4)

    # Build new code
    new_code = f"""{operation_start}
{existing_vars.rstrip()}
						const returnAll = true; // TODO: Add filters parameter
						const qs: IDataObject = {{}};

						responseData = await xiboApiRequestAllItems(
							this,
							'{endpoint}',
							accessToken,
							baseUrl,
							qs,
							returnAll ? undefined : 50,
						);"""

    return new_code

# Replace all getAll operations
new_content = re.sub(pattern, replace_getall, content, flags=re.DOTALL)

with open('nodes/Xibo/Xibo.node.ts', 'w') as f:
    f.write(new_content)

print("Updated getAll operations!")
