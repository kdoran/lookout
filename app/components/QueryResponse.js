import React from 'react'
import Pagination from 'components/Pagination'
import { Link } from 'react-router-dom'
import { withCommas } from 'utils/utils'

export default class extends React.Component {
  render () {
    const { result, couch, dbName, limit } = this.props
    // if (docs.length === 0) return <h4>No docs found.</h4>
    // const atLeast = (limit === docs.length) ? 'at least' : ''
    return (
      <div>
        {/* <h4>Docs found: {atLeast} {withCommas(docs.length)}</h4> */}
        <section className='docs-controls'>
          {/* <Pagination
            total={result.total_docs}
            displayed={result.docs.length}
            path={pathname}
            limit={limit}
            offset={offset}
          /> */}
        </section>
        <pre>
          {JSON.stringify(result, null, 2)}
        </pre>
        {/* <table>
          <thead>
            <tr>
              <th>id</th>
              <th>rev</th>
            </tr>
          </thead>
          <tbody>
            {docs.map(doc => {
              return (
                <tr key={doc._id}>
                  <td>
                    <Link target='_blank' to={`/${couch}/${dbName}/${doc._id}`}>
                      {doc._id}
                    </Link>
                  </td>
                  <td>{doc._rev}</td>
                </tr>
              )
            })}
          </tbody>
        </table> */}
      </div>
    )
  }
}
