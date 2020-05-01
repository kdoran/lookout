const React = require('react')
const { Link } = require('react-router-dom')

function ListModelsComponent ({urlPrefix, models}) {
  return (
    <div>
      <div className='controls'>
        <Link to={`${urlPrefix}/create`}>create model</Link>
      </div>
      <table>
        <thead>
          <tr>
            <th>View Docs</th>
            <th>createdAt</th>
            <th>createdBy</th>
            <th>updatedAt</th>
            <th>updatedBy</th>
            <th>edit</th>
          </tr>
        </thead>
        <tbody>
          {models.map(row => (
            <tr key={row.id}>
              <td><Link to={`${urlPrefix}/${row.name}/docs/`}>{row.name}</Link></td>
              <td>{row.createdAt}</td>
              <td>{row.createdBy}</td>
              <td>{row.updatedAt}</td>
              <td>{row.updatedBy}</td>
              <td><Link to={`${urlPrefix}/${row.id}`}>edit definition</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


module.exports = ListModelsComponent
